echo start installing dev tools

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
echo git clone zsh plugins done

sed -i "73c plugins=(git z zsh-syntax-highlighting zsh-autosuggestions)" ~/.zshrc
sed -i '73a ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#afffaf,bg=cyan,bold,underline"' ~/.zshrc
sed -i '74a ZSH_AUTOSUGGEST_STRATEGY=(history completion)' ~/.zshrc

echo "zsh" >> ~/.bashrc
source ~/.bashrc
echo finish overriding .zshrc

git config core.editor vi
echo finish change default git editor

npm i -g pm2 lerna
echo finished installing pm2 & lerna

export TZ="/usr/share/zoneinfo/Asia/Shanghai"
echo set timezone to CST