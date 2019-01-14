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
- name (String) - Child name
- manifest (Object) - TODO:
- isShow (Function) - Returns a boolean value for mounting or unmounting a child
- extraArgument - Optional extras

```js
    embla.child(
        'home',
        {
            mount: () => {},
            unmount: () => {},
            default: () => {}
        },
        () => true,
        { staticValue: 'foo' }
    )
```
