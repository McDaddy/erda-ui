echo installing dev tools

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

echo git clone done

sed -i "73c plugins=(git z zsh-syntax-highlighting zsh-autosuggestions)" ~/.zshrc
sed -i '73a ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#afffaf,bg=cyan,bold,underline"' ~/.zshrc
sed -i '74a ZSH_AUTOSUGGEST_STRATEGY=(history completion)' ~/.zshrc

echo "zsh" >> ~/.bashrc
source ~/.bashrc
source ~/.zshrc

git config core.editor vi