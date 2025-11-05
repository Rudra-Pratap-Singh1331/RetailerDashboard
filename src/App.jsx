import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Addproduct from './components/Addproduct';
import Home from './components/Home';

import Restock from './components/Restock';


function App() {
  const router = createBrowserRouter([
    {
      element: <AppLayout />,
      path: "/",
      children: [
        {
          element:<Home/>,
          path:"/",
        },
        {
          element: <Addproduct />,
          path: "/add",
        },
        {
          element:<Restock/>,
          path:"/restock"
        }
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router}>  </RouterProvider>
    </>
  );
}

export default App;
