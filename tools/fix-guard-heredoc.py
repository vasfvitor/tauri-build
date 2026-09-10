#!/usr/bin/env python3
"""Patch ~/.claude/hooks/guard_bash.py so the body of a *quoted* heredoc
(<<'EOF' / <<"EOF" / <<\\EOF) fed to `cat` or `tee` is not scanned as if it
were shell commands.

Why: the guard scans the whole command text, so writing a file with
`cat > x <<'EOF' ... EOF` is blocked whenever the file *content* contains
words like `sudo`, `init` or `gh workflow run`. A quoted heredoc fed to
`cat` or `tee` is literal data (no expansion, no execution), so its body is
safe to drop before analysis. Unquoted heredocs (<<EOF) keep being scanned
because `$(...)` expands inside them, and heredocs fed to anything else
(`python3 -`, `bash`, `node`, ...) keep being scanned because they run.

Usage:  python3 tools/fix-guard-heredoc.py [--dry-run] [path/to/guard_bash.py]
The original is backed up as guard_bash.py.bak-<timestamp> and the fixture
suite (test_guards.sh) is run afterwards; on failure the backup is restored.
"""
import os
import shutil
import subprocess
import sys
import time

HELPER = '''
# Header of a quoted heredoc: <<'EOF', <<"EOF" or <<\\EOF (optionally <<-).
QUOTED_HEREDOC_HDR_RE = re.compile(
    r"<<-?\\s*(?:'(?P<a>[A-Za-z_][A-Za-z0-9_]*)'|\\"(?P<b>[A-Za-z_][A-Za-z0-9_]*)\\"|\\\\(?P<c>[A-Za-z_][A-Za-z0-9_]*))")
# Only these consumers turn a heredoc into plain data. Anything else (python3 -,
# bash, node, eval, ...) may execute the body, so it keeps being scanned.
HEREDOC_DATA_SINKS = {"cat", "tee"}


def strip_quoted_heredocs(cmd):
    """Drop the body of a quoted heredoc when it is fed to cat/tee: that body is literal
    data (no expansion, no execution), so file *contents* must not trip command rules.
    Unquoted heredocs (<<EOF) and heredocs into interpreters are left alone."""
    out, pos = [], 0
    while True:
        m = QUOTED_HEREDOC_HDR_RE.search(cmd, pos)
        if not m:
            break
        delim = m.group("a") or m.group("b") or m.group("c")
        eol = cmd.find("\\n", m.end())
        if eol < 0:
            break
        term = re.compile(r"^[ \\t]*%s[ \\t]*$" % re.escape(delim), re.M)
        t = term.search(cmd, eol + 1)
        if not t:
            break
        # Program of the segment that owns this heredoc: text after the last
        # separator before `<<`, minus env assignments.
        head = re.split(r"\\|\\||&&|[;|&\\n`]|\\$\\(", cmd[pos:m.start()])[-1]
        words = [w for w in head.split() if "=" not in w or w.startswith(("-", "<", ">"))]
        prog = os.path.basename(words[0]) if words else ""
        if prog not in HEREDOC_DATA_SINKS:
            out.append(cmd[pos:t.end()])  # keep the body: it may be executed
            pos = t.end()
            continue
        out.append(cmd[pos:eol + 1])      # keep everything up to and incl. the header line
        out.append(delim)                 # keep the terminator so the line structure survives
        pos = t.end()
    out.append(cmd[pos:])
    return "".join(out)

'''

MARK = "def strip_quoted_heredocs("
ANCHOR = "def strip_wrappers(toks):"
ANALYZE_OLD = ("def analyze(cmd, cwd, v, depth=0):\n    if depth > 3:\n"
               "        v.deny(\"command nesting too deep to classify\")\n        return\n    text = expand_home(cmd)\n")
ANALYZE_NEW = ("def analyze(cmd, cwd, v, depth=0):\n    if depth > 3:\n"
               "        v.deny(\"command nesting too deep to classify\")\n        return\n"
               "    cmd = strip_quoted_heredocs(cmd)\n    text = expand_home(cmd)\n")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    path = args[0] if args else os.path.expanduser("~/.claude/hooks/guard_bash.py")
    src = open(path, encoding="utf-8").read()
    if MARK in src:
        print("already patched:", path)
        return 0
    if ANCHOR not in src or ANALYZE_OLD not in src:
        print("guard_bash.py layout not recognised; apply HELPER + ANALYZE_NEW from this script by hand")
        return 1
    new = src.replace(ANCHOR, HELPER + "\n" + ANCHOR, 1).replace(ANALYZE_OLD, ANALYZE_NEW, 1)
    if dry:
        sys.stdout.write(new)
        return 0
    backup = "%s.bak-%s" % (path, time.strftime("%Y%m%d-%H%M%S"))
    shutil.copy2(path, backup)
    open(path, "w", encoding="utf-8").write(new)
    print("patched %s (backup: %s)" % (path, backup))
    tests = os.path.join(os.path.dirname(path), "test_guards.sh")
    if os.path.exists(tests):
        print("running", tests)
        rc = subprocess.call([tests])
        if rc != 0:
            print("tests FAILED; restoring backup")
            shutil.copy2(backup, path)
            return rc
    return 0


if __name__ == "__main__":
    sys.exit(main())
