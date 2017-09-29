This is my attempt to move code that I had developed for a json document store into a different node package.

Currently this package has to be installed side-by-side next to the webpack environment, or deployed out to a separate
node repo and installed.

```bash
npm link
```

and in the package that will use this package

```bash
npm link json-data-store
```

##Running Tests
To run tests on the code base, use the following:
```bash
npm run-script test
```

For development, doing a build-watch cycle can be done with the following:
```bash
npm run-script test-watch
```