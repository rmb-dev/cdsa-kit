### [https://rmb-dev.github.io/cjca-kit//](https://rmb-dev.github.io/cjca-kit//)


Web dev meets cyber — my blog, portfolio of projects, and experiments.


cd ~/GitLab/rmb-dev.github.io
git remote set-url origin git@github.com:rmb-dev/cjca-kit.git
ssh -T git@github.com        # type "yes" to trust GitHub's host key
git push -u origin main



git push --force-with-lease=main:660b154 origin main

git fetch origin && git log origin/main --grep='Co-Authored-By: Claude' --oneline | wc -l


cd ~/GitLab/rmb-dev.github.io

# 1. Check the commit will be authored by you
git config user.name     # should print your name
git config user.email    # should print your GitHub email

# 2. Review and stage everything
git status
git add -A

# 3. Commit with your own message (no trailer)
git commit -m "new update"

# 4. Confirm no Claude lines anywhere in the history
git log --format='%an <%ae>%n%b' | grep -i claude || echo "clean"

# 5. Push
git push origin main
