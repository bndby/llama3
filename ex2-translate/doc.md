# Using a controller

Each controller has its own creation API, but typically you will create an instance and store it with the component:

```ts
class MyElement extends LitElement {
  private clock = new ClockController(this, 1000);
}
```

The component associated with a controller instance is called the host component.

The controller instance registers itself to receive lifecycle callbacks from the host component, and triggers a host update when the controller has new data to render. This is how the `ClockController` example periodically renders the current time.

A controller will typically expose some functionality to be used in the host's `render()` method. For example, many controllers will have some state, like a current value:

```ts
  render() {
    return html`
      <div>Current time: ${this.clock.value}</div>
    `;
  }
```

Since each controller has it's own API, refer to specific controller documentation on how to use them.
