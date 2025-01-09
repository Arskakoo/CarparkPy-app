# CarparkPy

Vapaiden parkkipaikkojen automaattinen tunnistus. Sekä käyttäjä ystävällinen käyttöliittymä.

## Asennus

Kloonaa repo ja lataa sinne seuraavat asiat:

### Python

Python tarvitsee seuraavat asiat:

```
pip install opencv-python
pip install matplotlib
pip install flask
pip install flask-cors
```

### Frontend

React frontend tarvitsee seuraavan:

```
npm i
```

### Käynnistys

Muista käynnistää seuraavat 3 kohtaa:

```
python main.py
```

Käynnistyksessä kestää hetki sillä se lataa tarvittavia ominaisuuksia

Valitse 1 jolloin saat valita parkkiruudut klikkaamalla kuvaa.

- Tallenna painamalla S

Tämän jälkeen käynnistä uudelleen ja valitse 2 jolloin ruutujen tunnistus alkaa

```
cd Flask
python app.py
```

```
cd Frontend
npm run dev
```

> [!NOTE]  
> Muista käynnistää jokainen tiedosto erikseen omissa konsoleissaan.

## Parkkipaikan tietojen muokkaaminen

Parkkipaikan tiedoikis tulevat automaattisesti nämä:

"name": "Example Park",<br>"location": "Example Address, 12",

Voit muokata oikeat parkkipaikan tiedot ParksConf.json tiedostosta.

## Tekijät

- [@Arska](https://www.github.com/arskakoo)
- [@Saow](https://www.github.com/saow)

## Dokumetaatio

[PowerPoint](https://shorturl.at/oEK6C)
