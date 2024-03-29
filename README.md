# Thunderbird Grammar Checker

REPLACED BY https://addons.thunderbird.net/en-US/thunderbird/addon/grammar-and-spell-checker/

Thunderbird add-on for checking grammar using [LanguageTool](https://www.languagetool.org/).

Official Thunderbird Grammar Checker add-on: [https://addons.thunderbird.net/thunderbird/addon/grammar-checker/](https://addons.thunderbird.net/thunderbird/addon/grammar-checker/)

[Supported languages](https://www.languagetool.org/languages/):
Asturian (ast),
Belarusian (be),
Breton (br),
Catalan (ca),
Danish (da),
German (de),
Greek (el),
English (en),
Esperanto (eo),
Spanish (es),
Persian (fa),
French (fr),
Galician (gl),
Italian (it),
Japanese (ja),
Khmer (km),
Dutch (nl),
Polish (pl),
Portuguese (pt),
Romanian (ro),
Russian (ru),
Slovak (sk),
Slovenian (sl),
Swedish (sv),
Tamil (ta),
Tagalog (tl),
Ukrainian (uk),
Chinese (zh).

## Quick Start

The add-on uses either a local LanguageTool server (recommended) or the public one.
Please note that the public server has the certain restrictions: [Public HTTP API](http://wiki.languagetool.org/public-http-api).

To use the local server, please [download](https://languagetool.org/) the stand-alone version for the desktop, unpack and run it as described here: [HTTP Server](http://wiki.languagetool.org/http-server).

The sample instructions:

    $ wget https://languagetool.org/download/LanguageTool-4.6.zip
    $ unzip LanguageTool-4.6.zip
    $ cd LanguageTool-4.6
    $ java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8081

## Development

In general, please follow the [Thunderbird extensions](https://developer.mozilla.org/en-US/Add-ons/Thunderbird) official documentations. There are several [Gradle](https://gradle.org/) tasks specified to make the development easier:

- Run [ESLint](https://eslint.org/) check for the JS files: `gradle eslint`
- Run unit-tests: `gradle test`
- Build the XPI file for the deployment: `gradle build`
