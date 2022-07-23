import css from "https://tfl.dev/@truffle/utils@~0.0.3/css/css.ts";

export default css`
  .root {
    display: flex;
    flex-direction: row;
  }
  .label {
    display: block;
    font-size: var(--tfl-font-size-body-md);
    margin-bottom: var(--tfl-spacing-xs);
  }

  .control {
    all: unset;
    padding: var(--tfl-spacing-xs) var(--tfl-spacing-sm);
    border: var(--tfl-border-width-sm) solid var(--tfl-color-surface-border);
    border-radius: var(--tfl-border-radius-md);
    width: 100%;
  }

  .control:focus {
    border: var(--tfl-border-width-sm) solid
      var(--tfl-color-surface-border-selected);
  }

  .start,
  .end {
    display: flex;
    margin: auto;
  }
  .start {
    display: flex;
    margin-inline-start: var(--tfl-spacing-sm);
  }
  .end {
    display: flex;
    margin-inline-end: var(--tfl-spacing-sm);
  }
`;
