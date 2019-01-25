[![Build Status](https://travis-ci.org/mitkaaa/embla.svg?branch=master)](https://travis-ci.org/mitkaaa/embla) [![Coverage Status](https://coveralls.io/repos/github/mitkaaa/embla/badge.svg?branch=master)](https://coveralls.io/github/mitkaaa/embla?branch=master)

## Metaframework
TODO: description

## Installation
TODO: description

## API

```createEmble(Observer)```

#### Observer

`Observer (Function)`

Arguments: 
- next (Function) - Function call when you need to update the state of children

```js
    const embla = createEmble((next) => {
        setTimeout(() => next(1000), 1000)
    })
```

#### Embla

`child (Function)` - Adds a child who listens to the observer change.

Arguments: 
- manifest (Object|Function) - TODO:
- isShow (Function) - Returns a boolean value for mounting or unmounting a child
- extraArgument - Optional extras

```js
    embla.child(
        {
            mount: () => {},
            unmount: () => {},
            default: () => {}
        },
        () => true,
        { staticValue: 'foo' }
    )
```


## Thanks
- [Micro Frontends](https://micro-frontends.org/)
- [Micro frontends — a microservice approach to front-end web development](https://medium.com/@tomsoderlund/micro-frontends-a-microservice-approach-to-front-end-web-development-f325ebdadc16)
- [single-spa](https://single-spa.js.org/)
