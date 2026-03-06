import os
import urllib.request
import json

API_KEY        = os.environ["GOOGLE_CREDENTIALS"]
SPREADSHEET_ID = os.environ["SPREADSHEET_ID"]
SHEET_NAME     = "galeria"

def fetch_galeria():
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}"
        f"/values/{SHEET_NAME}?key={API_KEY}"
    )
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read())

    rows   = data.get("values", [])
    header = rows[0]
    return [dict(zip(header, row)) for row in rows[1:]]

def main():
    rows = fetch_galeria()
    print(f"Total filas: {len(rows)}")

    for i, row in enumerate(rows, start=1):
        print(
            f"[{i}] ORDER={row.get('ORDER')} | "
            f"FOLDER NAME={row.get('FOLDER NAME')} | "
            f"LOGO={row.get('LOGO (LINK)')} | "
            f"FOLDER LINK={row.get('FOLDER LINK')}"
        )


if __name__ == "__main__":
    main()