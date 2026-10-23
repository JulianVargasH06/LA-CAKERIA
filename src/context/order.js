import { createContext, useContext } from 'react'

/**
 * Opens the shared order modal from any page:
 *   const openOrder = useOrder()
 *   openOrder('Red Velvet')                  // preselects a product
 *   openOrder('Torta personalizada', notes)  // with extra details
 * The provider lives in App.jsx (the site layout).
 */
export const OrderContext = createContext(() => {})

export const useOrder = () => useContext(OrderContext)
