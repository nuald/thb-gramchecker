# Thunderbird Grammar Checker
Thunderbird add-on for checking grammar using LanguageTool.

Official Thunderbird Grammar Checker add-on: [https://addons.mozilla.org/thunderbird/addon/14781](https://addons.mozilla.org/thunderbird/addon/14781)

[Supported languages](https://www.languagetool.org/languages/): English (en), Dutch (nl), French (fr),
German (de), Italian (it), Polish (pl), Romanian (ro), Russian (ru),
Slovak (sk), Slovenian (sl), Spanish (es), Swedish (sv), Ukrainian (uk), Asturian (ast), Belarusian (be),
Breton (br), Catalan (ca), Chinese (zh), Danish (da), Esperanto (eo), Galician (gl), Greek (el),
Japanese (ja), Khmer (km), Persian (fa), Portuguese (pt), Tagalog (tl), Tamil (ta).

## Quick Start

The add-on uses either a local LanguageTool server (recommended) or the public one.
Please note that the public server has the certain restrictions: [Public HTTP API](http://wiki.languagetool.org/public-http-api).

To use the local server, please [download](https://languagetool.org/) the stand-alone version for the desktop, unpack and run it as described here: [HTTP Server](http://wiki.languagetool.org/http-server).

The sample instructions:

    $ wget https://languagetool.org/download/LanguageTool-3.7.zip
    $ unzip LanguageTool-3.7.zip
    $ cd LanguageTool-3.7
    $ java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8081

## Development

In general, please follow the [Thunderbird extensions](https://developer.mozilla.org/en-US/Add-ons/Thunderbird) official documentations. There are several [Gradle](https://gradle.org/) tasks specified to make the development easier:

- `gradle eslint` __[Run ESLint check for the JS files]__
- `gradle xpi` __[Package the XPI file for the deployment]__
