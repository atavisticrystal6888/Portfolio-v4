import sqlite3
def q(p, n):
    print(f"--- {n} DB ---")
    try:
        c = sqlite3.connect(f"file:{p}?mode=ro", uri=True)
        ts = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'")]
        print(f"Tables: {ts}")
        if "ItemTable" in ts:
            ps = ["chat", "copilot", "session", "transcript", "history"]
            wh = " OR ".join([f"key LIKE '%{x}%'" for x in ps])
            rs = c.execute(f"SELECT key, value FROM ItemTable WHERE {wh}").fetchall()
            print(f"Matches: {len(rs)}")
            for k, v in rs: print(f"K: {k}\nV: {str(v)[:100]}...\n")
        c.close()
    except Exception as e: print(e)

q(r"C:\Users\DH40187606\AppData\Roaming\Code\User\workspaceStorage\4dcbd007a6d7360586add5ae6e7a679b\state.vscdb", "Old")
q(r"C:\Users\DH40187606\AppData\Roaming\Code\User\workspaceStorage\d81c0446c68db6b275bca8686efbb9d7\state.vscdb", "New")
