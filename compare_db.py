import sqlite3
import os

def get_data(db_path):
    if not os.path.exists(db_path):
        return None
    try:
        conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
        c = conn.cursor()
        c.execute("SELECT key, value FROM ItemTable")
        results = {r[0]: r[1] for r in c.fetchall()}
        conn.close()
        return results
    except:
        return None

old_data = get_data(r'C:\Users\DH40187606\AppData\Roaming\Code\User\workspaceStorage\4dcbd007a6d7360586add5ae6e7a679b\state.vscdb')
new_data = get_data(r'C:\Users\DH40187606\AppData\Roaming\Code\User\workspaceStorage\d81c0446c68db6b275bca8686efbb9d7\state.vscdb')

if old_data is None or new_data is None:
    print("Error: Could not read one or both databases.")
    exit(1)

patterns = ['chat', 'copilot', 'session', 'transcript', 'history', 'interactive']
keys = sorted(set(old_data.keys()) | set(new_data.keys()))
matching = [k for k in keys if any(p in k.lower() for p in patterns) and k != 'chat.ChatSessionStore.index']

print(f"{'Key':<60} | Old/New | Diff | UI-Crit")
print('-' * 90)
for k in matching:
    vo = old_data.get(k)
    vn = new_data.get(k)
    exists = f"{'Y' if vo else '-'} / {'Y' if vn else '-'}"
    diff = 'Yes' if vo != vn else 'No'
    crit = 'Likely' if any(p in k.lower() for p in ['session', 'history', 'transcript']) else 'No'
    print(f"{k[:60]:<60} | {exists} | {diff:<4} | {crit}")
