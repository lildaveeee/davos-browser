
#!/bin/sh

FILE="Davos.Browser-0.1.0.AppImage"
URL="https://github.com/LilDaveeee/davos-browser/releases/latest/download/$FILE"

INSTALL_DIR="$HOME/.local/bin"
DESKTOP_FILE="$HOME/.local/share/applications/davos-browser.desktop"

mkdir -p "$INSTALL_DIR"
mkdir -p "$(dirname "$DESKTOP_FILE")"

curl -L -o "$INSTALL_DIR/$FILE" "$URL"
chmod +x "$INSTALL_DIR/$FILE"

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=Davos Browser
Exec=$INSTALL_DIR/$FILE
Icon=web-browser
Type=Application
Categories=Network;Browser;
Terminal=false
EOF

