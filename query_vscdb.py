import sqlite3
import json

def get_chat_sessions(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM ItemTable WHERE key = 'chat.ChatSessionStore.index'")
        row = cursor.fetchone()
        conn.close()
        if row:
            data = json.loads(row[0])
            if isinstance(data, str):
                data = json.loads(data)
            return data
        return {}
    except Exception as e:
        return str(e)

def get_referencing_keys(db_path, session_ids):
    referencing_keys = {}
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM ItemTable")
        rows = cursor.fetchall()
        conn.close()
        for key, value in rows:
            if key == 'chat.ChatSessionStore.index':
                continue
            for sid in session_ids:
                if sid in str(value):
                    if sid not in referencing_keys:
                        referencing_keys[sid] = []
                    referencing_keys[sid].append(key)
        return referencing_keys
    except Exception as e:
        return str(e)

old_db = r'C:\Users\DH40187606\AppData\Roaming\Code\User\workspaceStorage\4dcbd007a6d7360586add5ae6e7a679b\state.vscdb'
new_db = r'C:\Users\DH40187606\AppData\Roaming\Code\User\workspaceStorage\d81c0446c68db6b275bca8686efbb9d7\state.vscdb'

old_data = get_chat_sessions(old_db)
new_data = get_chat_sessions(new_db)

old_entries = old_data.get('entries', {})
new_entries = new_data.get('entries', {})

old_ids = set(old_entries.keys())
new_ids = set(new_entries.keys())
missing_ids = list(old_ids - new_ids)

print(f"Number of entries in old: {len(old_entries)}")
print(f"Number of entries in new: {len(new_entries)}")
print(f"Number of missing IDs: {len(missing_ids)}")
print(f"Missing Session IDs: {missing_ids}")

representative_missing = missing_ids[:5]
print("\nMetadata for representative missing IDs:")
for mid in representative_missing:
    meta = old_entries[mid]
    print(f"ID: {mid}, Meta: {json.dumps(meta, indent=2)}")
    
refs = get_referencing_keys(old_db, representative_missing)
print("\nReferencing keys in ItemTable for these IDs (Old DB):")
print(json.dumps(refs, indent=2))
