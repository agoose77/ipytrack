ipytrack
===============================

Object tracking in the Jupyter notebook or Jupyter lab

Installation
------------

To install use pip:

    $ pip install ipytrack
    $ jupyter nbextension enable --py --sys-prefix ipytrack


For a development installation (requires npm),

    $ git clone https://github.com/maartenbreddels/ipytrack.git
    $ cd ipytrack
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix ipytrack
    $ jupyter nbextension enable --py --sys-prefix ipytrack
