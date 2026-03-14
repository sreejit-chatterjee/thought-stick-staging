# Working with branches (Git + GitHub) — simple guide

You’re used to: commit on your machine → push to `main`. This guide adds **branches** so you can try things safely and keep `main` clean. Same tools (Git + GitHub), one extra idea.

---

## Why use a branch?

- **Keep `main` safe** — you push new work to a branch first; `main` only changes when you merge.
- **Try things** — experiment or rework commits on a branch; if it goes wrong, `main` is unchanged.
- **Review your own work** — on GitHub you can open a Pull Request from your branch to `main` and see the diff before merging.

You can still “commit and push to main” for tiny fixes; use a branch when you want a safety net or a clear place to rework commits.

---

## The idea in one line

**Branch = a copy of your project you can change. When it’s ready, you merge that copy into `main`.**

- `main` = the “official” line of history (what you have now).
- A branch = another line that starts from `main` (or from another branch). You commit and push to the branch; `main` doesn’t change until you merge.

---

## Basic workflow (create branch → work → push → merge)

### 1. Make sure you’re on `main` and up to date

```bash
git checkout main
git pull origin main
```

- **checkout** = “switch to this branch.”
- **pull** = get the latest commits for `main` from GitHub.

### 2. Create a new branch and switch to it

```bash
git checkout -b my-feature
```

- **`-b`** = create the branch and switch to it in one step.
- `my-feature` = branch name (use something short and clear, e.g. `add-login`, `fix-nav`).

From now on, **all new commits** go onto `my-feature`, not `main`.

### 3. Work as usual: edit, commit, push

Edit files, then:

```bash
git add .
git commit -m "Your message"
git push origin my-feature
```

- **push origin my-feature** = send this branch (and its commits) to GitHub. `main` on GitHub is still unchanged.

### 4. Merge the branch into `main` (two ways)

**Option A — On GitHub (easiest)**  
1. Open your repo on GitHub.  
2. You’ll often see “Compare & pull request” for the branch you just pushed.  
3. Open a **Pull Request** from `my-feature` → `main`.  
4. Review the diff, then click **Merge pull request**.  
5. Optionally delete the branch on GitHub after merging.

**Option B — On your machine**  
```bash
git checkout main
git merge my-feature
git push origin main
```

Then you can delete the branch if you want:

```bash
git branch -d my-feature
```

---

## Handy commands (copy-paste reference)

| What you want to do              | Command |
|----------------------------------|--------|
| See which branch you’re on       | `git branch` (current has `*`) or `git status` |
| Switch to `main`                  | `git checkout main` |
| Create and switch to a new branch| `git checkout -b branch-name` |
| Push your branch to GitHub       | `git push origin branch-name` |
| Update `main` from GitHub         | `git checkout main` then `git pull origin main` |
| Merge a branch into `main`       | `git checkout main` then `git merge branch-name` |
| Delete a branch locally          | `git branch -d branch-name` |

---

## How this fits with “rework commits”

If you start using branches:

1. You do your work on a branch (e.g. `my-feature`).
2. You commit and push that branch.
3. You can then run the **rework-commits** skill on that branch: it will split your changes into small, logical commits on the same branch.
4. You push the updated branch and open (or update) a Pull Request to `main`.
5. You (or someone else) reviews the PR and then merges into `main`.

So: **branch = the place where you (and the rework-commits skill) can reshape history; `main` stays clean until you merge.**

---

## Quick mental model

- **main** = “live” or “default” line of work.
- **branch** = “draft” line that started from `main`. You commit and push to the draft; when it’s good, you merge the draft into `main`.

You’re not changing how you code or commit — you’re just committing to a branch first, then merging to `main` when you’re happy. GitHub’s Pull Request is the “review and merge” step.
