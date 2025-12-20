import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './dataProvider/strore.js'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
       <Provider store={store}>
          <BrowserRouter
          basename='pos'
          >
            <App/>
          </BrowserRouter>
      </Provider>
  </StrictMode>
)
