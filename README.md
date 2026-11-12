# vysledky.bkludgerovice – web výsledků BK Ludgeřovice

Statický web (jeden soubor `index.html`), který si při otevření načte data ze složky `data` a sám spočítá všechny přehledy a statistiky. Nic se nemusí kompilovat ani instalovat.

## Co je v repozitáři

| Soubor | K čemu je |
|---|---|
| `index.html` | Celý web včetně loga. Měnit jen při úpravách vzhledu. |
| `data/vysledky.csv` | **Všechny výsledky.** Tenhle soubor po každém závodě nahradíte novým. |
| `data/zavody.json` | Plné názvy závodů, data konání, příští závod, odkazy na Facebook a Instagram. |
| `data/opravy.json` | Sloučení duplicitních běžců a sjednocení názvů oddílů. Vzniká v nástroji **Kontrola dat**, ručně ho neupravujte. |

## Aktualizace výsledků po závodě

1. Do souhrnné tabulky výsledků (Excel) doplňte nový závod. Sloupce zůstávají stejné:
   `Běžec, Ročník, Závod, Trať, Čas, Umístění, Oddíl / město, Pohlaví`
   - Závod ve tvaru `Kód (rok)`, např. `L kros (2026)`.
   - Čas `h:mm:ss`, případně s desetinami `0:23:03,3`.
   - Pohlaví `M` nebo `Ž`.
2. Excel → Soubor → Uložit jako → **CSV UTF-8 (s oddělovači)**, název `vysledky.csv`.
   (Web zvládne oddělovač čárku i středník.)
3. Na github.com otevřete repozitář → složka `data` → **Add file → Upload files** → přetáhněte `vysledky.csv` → **Commit changes**.
4. Za 1–2 minuty je web aktuální (případně obnovte stránku Ctrl+Shift+R).

## Kontrola duplicit a oddílů

Po nahrání nové tabulky otevřete nástroj **Kontrola dat** (artefakt v Claude), v záložce *Export a data* do něj nahrajte stejnou tabulku a projděte záložky *Běžci* a *Oddíly*. Pak stáhněte `opravy.json` a nahrajte ho na GitHub do složky `data`. Rozhodnuté dvojice si nástroj pamatuje, takže příště uvidíte jen nové případy.

## Nový závod nebo nový ročník

Ročník existujícího závodu se objeví sám. Úplně nový závod (nový kód) doplňte do `data/zavody.json` do seznamu `serie` – jinak se na webu zobrazí jen pod svým kódem. Přesné datum ročníku můžete přidat do `datumy`, příští závod do `pristi`.

## Zveřejnění na WEDOS (vysledky.bkludgerovice.cz)

Cesta dat: **Prezentace závodů → Stáhnout data pro web → GitHub (složka data) → GitHub Actions → FTP WEDOS → vysledky.bkludgerovice.cz**

- Workflow je v souboru `.github/workflows/nasazeni.yml` a spustí se po každém Commit changes.
- Přístupy k FTP jsou jen v GitHub Secrets (Settings → Secrets and variables → Actions): `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SLOZKA`. Nikam jinam je nepište.
- `FTP_SLOZKA` je `/www/subdom/vysledky/` (s lomítkem na konci). Pokud má FTP účet domovskou složku přímo ve `www/subdom/vysledky`, je to `./`.
- Průběh vidíte v záložce **Actions**: zelená fajfka = hotovo, červený křížek = klikněte na něj a přečtěte si chybu.
- Když nahrávání hlásí chybu spojení, zkuste v `nasazeni.yml` změnit `protocol: ftps` na `protocol: ftp`.
- Když se na adrese vysledky.bkludgerovice.cz objeví klubový WordPress místo výsledků, chybí v souboru `www/.htaccess` pravidla WEDOS pro subdomény (viz znalostní báze WEDOS, heslo „subdom .htaccess“).

## Fotky a diplomy (fotky.html)

Stránka `fotky.html` ukazuje běžcům jejich fotky podle startovního čísla nebo jména a vytváří elektronický diplom. Ve výsledcích se u jmen objeví ikona 📷 (fotky) a 🎖 (diplom), v menu přibude záložka **Fotky**.

| Soubor | K čemu je |
|---|---|
| `fotky.html` | Stránka „Fotky a diplomy“. |
| `fotky-odkazy.js` | Doplněk pro `index.html`: ikony u jmen a záložka Fotky. V `index.html` je kvůli němu jen řádek `<script src="fotky-odkazy.js" defer></script>` před `</body>`. Pokud `index.html` někdy nahradíte novou verzí, tento řádek do ní vraťte. |
| `logo.png` | Logo pro stránku fotek a diplomy. |

Data nejsou v repozitáři. Stránka si je načte z Google Sheetu „fotky podle čísel“ (Apps Script, webová aplikace). Které závody mají fotky, se nastavuje v `data/zavody.json`:

```json
"fotky": {
  "L kros (2026)": {
    "katalog": "https://script.google.com/macros/s/…/exec",
    "medaile": "medaile-lkros-2026.png"
  }
}
```

- Klíč musí být přesně stejný jako sloupec „Závod“ ve `vysledky.csv` (např. `L kros (2026)`).
- `katalog` je adresa webové aplikace z Apps Scriptu (končí `/exec`). Prázdná hodnota = fotky se nezobrazí.
- `medaile` je obrázek medaile (PNG s průhledným pozadím) v kořeni repozitáře, zobrazí se na diplomu. Nepovinné.
- Pro další závod se založí nový Sheet se skriptem a přidá se další řádek.
- Fotky se párují se jmény ve výsledcích podle jména (nezáleží na pořadí jména a příjmení ani na diakritice).
