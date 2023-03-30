# ACS Files Service

> The [AMRC Connectivity Stack (ACS)](https://github.com/AMRC-FactoryPlus/amrc-connectivity-stack) is an open-source implementation of the AMRC's [Factory+ Framework](https://factoryplus.app.amrc.co.uk).

This `acs-files` service satisfies the **Files** component of the Factory+ framework and provides a backend service used for uploading files from devices/services through Factory+.

For more information about the Files component of Factory+ see the [specification](https://factoryplus.app.amrc.co.uk) or for an example of how to deploy this service see the [AMRC Connectivity Stack repository](https://github.com/AMRC-FactoryPlus/amrc-connectivity-stack).

## Known issues & further development

* No unit tests
* Custom metadata/tags have not been thoroughly tested
* File Schema Type Mapping configs is due to be refactored to be more object-oriented and less static
* On docker build, the @amrc-factoryplus/utilities npm dependency sometimes does not pull `gssapi.js`, although this can be fixed by moving `gssapi.js` to dependencies instead of optionalDependencies.