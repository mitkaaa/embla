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

test('Simple', (done) => {
  embla.child(
    {
      default: (type) => {
        /* #1 */
        expect(type).toBe('home');
        return element;
      },
      mount: (transferredElement) => {
        /* #2 */
        expect(transferredElement).toBe(element);
        /*
          После монтирования делаем сайд эффект для анмаунта и вызова другого чайлда
        */
        sideEffect('about');
      },
      unmount: (type) => {
        /* #3 */
        expect(type).toBe('about');
      },
    },
    type => type === 'home',
  );
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
