const { default: createEmbla } = require('..');

let embla;
let sideEffect;

const element = document.createElement('div');

beforeEach(() => {
  embla = createEmbla((next) => {
    sideEffect = next;
    next('home');
  });
});

afterEach(() => {
  embla();
});

const bodyAPP = () => new Promise(resolve => setTimeout(
  () => resolve({
    default: (type) => {
      /* #1 */
      expect(type).toBe('home');
      return element;
    },
    mount: (transferredElement) => {
      /* #2 */
      expect(transferredElement).toBe(element);
      sideEffect('about');
    },
    unmount: (type) => {
      /* #3 */
      expect(type).toBe('about');
    },
  }),
  1000,
));

it('Promise', (done) => {
  embla.child(bodyAPP, type => type === 'home');
  embla.child(
    {
      default: (type) => {
        /* #4 */
        expect(type).toBe('about');
      },
      mount: (transferredElement) => {
        /* #5 */
        expect(transferredElement).toBe(undefined);
        done();
      },
      unmount: (type) => {
        /* #6 */
        expect(type).toBe('about');
      },
    },
    type => type === 'about',
  );
});

it('Sudden side effect for promise', (done) => {
  setTimeout(() => {
    sideEffect('about');
  }, 900);
  embla.child(() => bodyAPP(done), type => type === 'home');
  embla.child(
    {
      default: (type) => {
        /* #4 */
        expect(type).toBe('about');
      },
      mount: (transferredElement) => {
        /* #5 */
        expect(transferredElement).toBe(undefined);
        done();
      },
      unmount: (type) => {
        /* #6 */
        expect(type).toBe('about');
      },
    },
    type => type === 'about',
  );
});
