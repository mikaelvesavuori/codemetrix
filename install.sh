mkdir -p ~/.codemetrix/
cp codemetrix.sh ~/.codemetrix/
cp dist/index.mjs ~/.codemetrix/
echo "alias codemetrix=\"bash ~/.codemetrix/codemetrix.sh\"" >>~/.zshrc
