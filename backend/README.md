# Backend du géoportail

**TABLE OF CONTENTS:**
- [Backend du géoportail](#backend-du-géoportail)
  - [Préambule](#préambule)
  - [Nota](#nota)
  - [Initialisation du projet](#initialisation-du-projet)
  - [Création du projet](#création-du-projet)
  - [Sources](#sources)

## Préambule
Le géoportail s'inscrit dans le cadre global du projet IUOC (Infrastructure Universelle des Objets Connectés).

Il a pour but de visualiser la position géographiques des capteurs intégrés au projet IUOC.
Cela peut être des capteurs statiques (volets, caméra, ...) présents au sein et à l'extérieur des bâtiments de la HEIG-VD, mais aussi des objets connectés en mouvement (capteur de gaz sur un bus, ...).

## Nota
Le backend est développé avec le framework python `GeoDjango`.

Le modèle relationnel de la base de données est une version restreinte du modèle développé avec Yves Chevallier (iAi), Jens Ingensand (insit) et Sébastien Guillaume (insit). Le modèle complet se trouve sur le gitlab du groupe Géomatique de l'insit (...).

## Initialisation du projet
1. Création d'un environnement virtuel python (nommé `venv`), ainsi que l'activation:
```ps
python -m venv env
source env/Scripts/activate
```

>[!WARNING]
> Vous devez toujours être dans l'environnement virtuel si vous faites des modifications au projet. 
> Si vous avez un doute, vous pouvez tapez la commande `which python`pour savoir avec quel python vous travaillez.

2. Installation de django et package utiles
```ps
python -m pip install --upgrade pip #mise à jour de pip
python -m pip install django

# Installation de Django REST Framework
python -m pip install djangorestframework
python -m pip install markdown             # Markdown support for the browsable API.
python -m pip install django-filter        # Filtering support
```

3. Installation des librairies géospatiales
```ps
python -m pip install geos
python -m pip install proj
python -m pip install rtree
``` 

4. Installation de GDAL
Commencer par télécharger le *wheel* pour GDAL relatif à la version du Python que vous utiliser. 
Le lien est [https://github.com/cgohlke/geospatial-wheels/releases/tag/v2024.2.18](https://github.com/cgohlke/geospatial-wheels/releases/tag/v2024.2.18).
La commande pour installer devient :
```ps
python -m pip install gdal-X.Y.Z-cpXXX-cpXXX-win_XXX.whl
```` 
avec X, Y et Z comme nom de version.

5. Installation de librairies externes utiles
```ps
python -m pip install numpy
python -m pip install binutils
python -m pip install psycopg
python -m pip install psycopg2
```

6. Geler l'environnement virtuel
```ps
pip freeze > requirements.txt
```
>[!NOTE]
> Cela permet de lister l'ensemble des packages et librairies utilisés dans le projet. Cela permet aussi de réinstaller l'ensemble des packages depuis ce fichier sur une autre machine avec la commande `pip install -r requirements.txt`

## Création du projet




## Sources
- [Dockerizing Django with PostgreSQL, PostGIS and GeoDjango for Location Search, _aaronnotes.com_](https://aaronnotes.com/2023/10/dockerizing-django-with-postgresql-postgis-and-geodjango-for-location-search/)
- [Dockerizing Django with Postgres, Gunicorn and Nginx, _testdriven.io_](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
