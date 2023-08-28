mkdir -p ~/.codemetrix/
cp codemetrix.sh ~/.codemetrix/
cp dist/index.js ~/.codemetrix/
echo "alias codemetrix=\"bash ~/.codemetrix/codemetrix.sh\"" >>~/.zshrc
