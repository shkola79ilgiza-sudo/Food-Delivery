import { render } from '@testing-library/react';

test('testing environment works', () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  expect(div).toBeInTheDocument();
  document.body.removeChild(div);
});

test('basic math works', () => {
  expect(1 + 1).toBe(2);
});

test('render works', () => {
  const TestComponent = () => <div data-testid="test">Test</div>;
  const { getByTestId } = render(<TestComponent />);
  expect(getByTestId('test')).toHaveTextContent('Test');
});
