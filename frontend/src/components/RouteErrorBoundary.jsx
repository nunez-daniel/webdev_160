// RouteErrorBoundary.jsx
import { useRouteError } from "react-router-dom"; 

function RouteErrorBoundary() {
  const error = useRouteError();
  console.error(error); 

  return (
    <div id="error-page" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred on this page.</p>
      <p>
        <span style={{ color: 'red' }}>Error:</span> 
        {error.statusText || error.message}
      </p>
    </div>
  );
}
export default RouteErrorBoundary;