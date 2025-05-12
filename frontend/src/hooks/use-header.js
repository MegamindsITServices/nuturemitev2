import { useLocation } from "react-router-dom"

export const useHeaderTitle = () =>{
    const location = useLocation()    
    const headerTitle = {
        "/admin/dashboard" : "Dashboard",
        "/admin/products" : "Products",
        "/admin/add-product" : "Add Product",
        "/admin/collections" : "Collections",
        "/admin/add-collections" : "Add Collection",
        "/admin/add-banner" : "Add Banner",
        "/admin/banners" : "All Banners",
        "/admin/admins" : "Administrators",
        "/admin/add-admin" : "Add Administrator",
        "/admin/orders" : "Orders"
    }
    return headerTitle[location.pathname] || "Dashboard"
}