import { Link } from "react-router-dom";
import './admin.css'
import { StepBackIcon } from "lucide-react";


function AdminHome () {
    return <>
        <div className="admin-page">
            <div className="admin-header">
                <Link 
                    className="navigate-back-header"
                    to={"/"}
                >
                    <StepBackIcon size={35}/>
                    <p>Back</p>
                </Link>
                <h1>Admin</h1>
            </div>
            <div className="admin-main">
                <div className="users-container-management">
                    <div className="manage-users-container">
                        <h1>User Management</h1>
                        <div className="add-user-container">
                            <Link to='/add-user'>Add User</Link>
                        </div>
                        <div className="users-link-container">
                            <Link to='/list-users'>
                                Manage User
                            </Link>
                        </div>
                    </div>
                  
                </div>
                <div className="forms">
                    <div className="food-form">
                        <h2>Food Form</h2>
                        <p>You can create Food items with either existed Food Categories or totally new Food items with new Food Categories</p>
                        <Link to="/food/Food">Start</Link>
                    </div>
                    <div className="food-form">
                        <h2>Drink Form</h2>
                        <p>You can create Drink items with either existed Drink Categories or totally new Drink items with new Drink Categories</p>
                        <Link to="/food/Drinks">Start</Link>
                    </div>
                    <div className="tables-form">
                        <h2>Table Form</h2>
                        <p>The same with Tables. Create Tables With existed Floor or with new Floor </p>
                        <Link to='/tablesForm/'>Start</Link>
                    </div>
                </div>
           
                
            </div>
        </div>
    </>


}





export default AdminHome;