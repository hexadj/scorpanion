# Thème Scorpanion — carte des couleurs

Les valeurs sont définies dans [`src/index.css`](../src/index.css) via `:root` et `.dark`.  
Dans l’application, `html` porte la classe `dark`, donc les tokens affichés viennent principalement de `.dark`.

---

## Où ça s’affiche dans l’application ?

| Token CSS | Rôle (partie de l’UI) | Exemples concrets |
|-----------|------------------------|-------------------|
| **`--background`** | Fond **global** derrière toutes les pages | `body`, arrière-plan des écrans |
| **`--foreground`** | **Texte et icônes** par défaut sur ce fond | Titres, paragraphes, libellés standards |
| **`--card`** | Fond des **blocs type “carte”** (surélevés par rapport à la page) | `Card`, panneaux, zones regroupées |
| **`--card-foreground`** | Texte **à l’intérieur** d’une carte | Contenu d’une `Card` |
| **`--popover`** | Fond des **éléments flottants** | Menus, `Popover`, calendriers, overlays |
| **`--popover-foreground`** | Texte dans ces popovers | |
| **`--primary`** | **Action principale** (CTA) | Bouton `Button` (variante par défaut, actions principales) |
| **`--primary-foreground`** | Texte **sur** un bouton primaire | Libellé sur fond doré |
| **`--secondary`** | **Surfaces secondaires** | Boutons/labels secondaires, bandeaux |
| **`--secondary-foreground`** | Texte sur fond secondaire | |
| **`--muted`** | Zones **atténuées** | Lignes, skeletons, zones “discrètes” |
| **`--muted-foreground`** | **Texte secondaire** | Hints, sous-titres, placeholders |
| **`--accent`** | **Survol / sélection** légère | Hover sur lignes, items sélectionnables |
| **`--accent-foreground`** | Texte quand la surface est en `accent` | |
| **`--destructive`** | **Erreur** ou action **dangereuse** | Suppression, messages d’erreur |
| **`--border`** | **Bordures** générales | Séparateurs, cadres |
| **`--input`** | Bordure / état des **champs** (`Input`) | Bordures/états des inputs |
| **`--ring`** | **Focus clavier** (accessibilité) | Anneau de focus autour des boutons/champs |
| **`--chart-1` … `--chart-5`** | **Graphiques** | Couleurs de séries |
| **`--sidebar-*`** | **Barre latérale** (tokens shadcn) | Si une sidebar est ajoutée plus tard |
| **`--score-table-highlight`** | Surbrillance de la manche en cours (tableau des scores) | `bg-score-table-highlight` |

---

## Valeurs `:root`

| Token | Valeur |
|------|--------|
| `--background` | `#1a3d2e` |
| `--foreground` | `#f4f1eb` |
| `--card` | `#2e3636` |
| `--card-foreground` | `#f4f1eb` |
| `--popover` | `#3e5048` |
| `--popover-foreground` | `#f4f1eb` |
| `--primary` | `#d3a56d` |
| `--primary-foreground` | `#1a3d2e` |
| `--secondary` | `#3d4f5f` |
| `--secondary-foreground` | `#f4f1eb` |
| `--muted` | `#2d3834` |
| `--muted-foreground` | `#b0c6b8` |
| `--accent` | `#819d83` |
| `--accent-foreground` | `#1a3d2e` |
| `--destructive` | `#c45c5c` |
| `--border` | `#5d7269` |
| `--input` | `#7a9086` |
| `--ring` | `#d3a56d` |
| `--chart-1` | `#d3a56d` |
| `--chart-2` | `#819d83` |
| `--chart-3` | `#3d4f5f` |
| `--chart-4` | `#3e5048` |
| `--chart-5` | `#c45c5c` |
| `--sidebar` | `#3e5048` |
| `--sidebar-foreground` | `#f4f1eb` |
| `--sidebar-primary` | `#d3a56d` |
| `--sidebar-primary-foreground` | `#1a3d2e` |
| `--sidebar-accent` | `#819d83` |
| `--sidebar-accent-foreground` | `#1a3d2e` |
| `--sidebar-border` | `#5d7269` |
| `--sidebar-ring` | `#d3a56d` |
| `--score-table-highlight` | `#3d5245` |

---

## Valeurs `.dark` (utilisées par l’app)

| Token | Valeur |
|------|--------|
| `--background` | `#385d4d` |
| `--foreground` | `#e8e4e0` |
| `--card` | `#374848` |
| `--card-foreground` | `#e8e4e0` |
| `--popover` | `#2e3636` |
| `--popover-foreground` | `#e8e4e0` |
| `--primary` | `#d3a56d` |
| `--primary-foreground` | `#1a3d2e` |
| `--secondary` | `#3d4f5f` |
| `--secondary-foreground` | `#e8e4e0` |
| `--muted` | `#252b2b` |
| `--muted-foreground` | `#819d83` |
| `--accent` | `#819d83` |
| `--accent-foreground` | `#1a3d2e` |
| `--destructive` | `#c45c5c` |
| `--border` | `#3d4f5f` |
| `--input` | `#a3bcd1` |
| `--ring` | `#d3a56d` |
| `--chart-1` | `#d3a56d` |
| `--chart-2` | `#819d83` |
| `--chart-3` | `#3d4f5f` |
| `--chart-4` | `#2e3636` |
| `--chart-5` | `#c45c5c` |
| `--sidebar` | `#2e3636` |
| `--sidebar-foreground` | `#e8e4e0` |
| `--sidebar-primary` | `#d3a56d` |
| `--sidebar-primary-foreground` | `#1a3d2e` |
| `--sidebar-accent` | `#819d83` |
| `--sidebar-accent-foreground` | `#1a3d2e` |
| `--sidebar-border` | `#3d4f5f` |
| `--sidebar-ring` | `#d3a56d` |
| `--score-table-highlight` | `#3d5245` |

---

## Comment c’est utilisé dans le code ?

- **Tailwind** : `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, etc.
- **Composants UI** (`src/components/ui/*`) : ils combinent ces classes ; changer un token dans `index.css` met à jour **toute l’app** qui s’appuie dessus.
- **Toasts (Sonner)** : couleurs alignées via les variables CSS (fond proche de `popover`).

Pour modifier le thème : édite **`src/index.css`** (les tokens) et garde `:root` / `.dark` synchronisés quand tu changes l’intention visuelle.
