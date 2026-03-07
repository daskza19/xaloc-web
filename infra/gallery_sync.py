import os
import json
import shutil
import urllib.request
import urllib.parse

API_KEY        = "AIzaSyCe-NEPXAU1tvpsCxu6Segh73LmKXcWTtY"
SPREADSHEET_ID = "1Y4dWIL670gYEEaKEx2_Gi9dDw1F0_VsapHmDa2127bU"
LOGOS_FOLDER_ID = "1lKdDBhpsOMhCwLqL0GA4jaaZGM8FptFi"
# API_KEY        = os.environ["GOOGLE_CREDENTIALS"]
# SPREADSHEET_ID = os.environ["SPREADSHEET_ID"]
SHEET_NAME     = "galeria"
GALLERY_PATH = "images/gallery"
LOGOS_PATH   = os.path.join(GALLERY_PATH, "logos")

ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]


# ============ SETUP ============
def setup_folders():
    if os.path.exists(GALLERY_PATH):
        shutil.rmtree(GALLERY_PATH)
        print(f"🗑️  Eliminada carpeta {GALLERY_PATH}")

    os.makedirs(LOGOS_PATH)
    print(f"📁 Creada carpeta {GALLERY_PATH} con subcarpeta logos/")


# ============ SHEETS ============
def fetch_galeria():
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}"
        f"/values/{SHEET_NAME}?key={API_KEY}"
    )
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read())

    rows   = data.get("values", [])
    header = rows[0]
    return [dict(zip(header, row)) for row in rows[1:] if any(cell.strip() for cell in row)]


# ============ DRIVE ============
def drive_list_files(folder_id):
    mime_query = " or ".join([f"mimeType='{m}'" for m in ALLOWED_MIME_TYPES])
    query = f"'{folder_id}' in parents and ({mime_query}) and trashed=false"
    url = (
        f"https://www.googleapis.com/drive/v3/files"
        f"?q={urllib.parse.quote(query)}"
        f"&fields=files(id,name,mimeType)"
        f"&pageSize=100"
        f"&key={API_KEY}"
    )
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read())
    return data.get("files", [])


def drive_download_file(file_id, dest_path):
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media&key={API_KEY}"
    with urllib.request.urlopen(url) as r:
        with open(dest_path, "wb") as f:
            f.write(r.read())


def find_logo_in_folder(folder_id, logo_name):
    """Busca <folder_name>.png dentro de una carpeta de Drive."""
    query = f"'{folder_id}' in parents and name='{logo_name}.png' and trashed=false"
    url = (
        f"https://www.googleapis.com/drive/v3/files"
        f"?q={urllib.parse.quote(query)}"
        f"&fields=files(id,name)"
        f"&key={API_KEY}"
    )
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read())
    files = data.get("files", [])
    return files[0] if files else None

def extract_folder_id(folder_link):
    """Extrae el ID de una URL de Google Drive o devuelve el valor tal cual si ya es un ID."""
    if "drive.google.com" in folder_link:
        # Formato: https://drive.google.com/drive/folders/ID?usp=...
        parts = folder_link.split("/folders/")
        if len(parts) > 1:
            return parts[1].split("?")[0].strip()
    return folder_link.strip()

# ============ MAIN ============
def main():
    # 1. Limpiar y crear estructura de carpetas
    setup_folders()

    # 2. Leer hoja de cálculo
    rows = fetch_galeria()
    print(f"\n📊 Total filas en '{SHEET_NAME}': {len(rows)}\n")

    for i, row in enumerate(rows, start=1):
        order       = row.get("ORDER", "").strip()
        folder_name = row.get("FOLDER NAME", "").strip()
        folder_link = row.get("FOLDER LINK", "").strip()
        folder_id   = extract_folder_id(folder_link)

        print(f"[{i}] Procesando: {folder_name} (id: {folder_id})")

        if not folder_name or not folder_id:
            print(f"     ⚠️  Fila incompleta, saltando.")
            continue

        # 3. Crear carpeta local con el nombre del evento
        event_path = os.path.join(GALLERY_PATH, folder_name)
        os.makedirs(event_path, exist_ok=True)
        print(f"     📁 Carpeta creada: {event_path}")

        # 4. Buscar y descargar logo con nombre del evento
        logo_file = find_logo_in_folder(LOGOS_FOLDER_ID, folder_name)
        if logo_file:
            logo_dest = os.path.join(LOGOS_PATH, f"{folder_name}.png")
            drive_download_file(logo_file["id"], logo_dest)
            print(f"     🖼️  Logo descargado: {logo_dest}")
        else:
            print(f"     ⚠️  No se encontró {folder_name}.png en la carpeta de logos de Drive")

        # 5. Descargar todas las fotos de la carpeta del evento en Drive
        
        photos = drive_list_files(folder_id)
        print(f"     📷 Fotos encontradas: {len(photos)}")

        for photo in photos:
            dest = os.path.join(event_path, photo["name"])
            try:
                drive_download_file(photo["id"], dest)
                print(f"        ✅ {photo['name']}")
            except Exception as e:
                print(f"        ❌ Error descargando {photo['name']}: {e}")

        print()


if __name__ == "__main__":
    main()