
import sqlite3, os
old_p = r"C:\Users\DH40187606\AppData\Roaming\Code\User\workspaceStorage\4dcbd007a6d7360586add5ae6e7a679b\state.vscdb"
new_p = r"C:\Users\DH40187606\AppData\Roaming\Code\User\workspaceStorage\d81c0446c68db6b275bca8686efbb9d7\state.vscdb"
def g(p):
 conn = sqlite3.connect(f"file:{p}?mode=ro", uri=True)
 d = {r[0]: r[1] for r in conn.execute("SELECT key, value FROM ItemTable")}
 conn.close()
 return d
o, n = g(old_p), g(new_p)
ks = sorted([k for k in (set(o)|set(n)) if any(x in k.lower() for x in ["chat","copilot","session","transcript","history","interactive"]) and k != "chat.ChatSessionStore.index"])
print(f"{`Key` :<60} | O/N | Diff | Crit")
for k in ks:
 vo, vn = o.get(k), n.get(k)
 print(f"{k[:60]:<60} | {`Y` if vo else `-`}/{`Y` if vn else `-`} | {`Yes` if vo!=vn else `No `} | {`Likely` if any(x in k.lower() for x in [`session`,`history`,`transcript`]) else `No`}")

