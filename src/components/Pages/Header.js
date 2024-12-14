import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";
import Cookies from "js-cookie";
import axios from "axios";
import VertNav from "./VertNav"; 
import config from "../../config";

function Header() {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const userType = localStorage.getItem("type");
  const sname = localStorage.getItem("s-name");
  const branchName = localStorage.getItem("branch_name");

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `${config.apiUrl}/api/swalook/salonbranch/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        setBranches(res.data.table_data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch branches. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);




  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); 
      } else {
        setSidebarOpen(false); 
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); 





  const toggleBranchDropdown = () => {
    setShowBranchDropdown((prev) => !prev);
    if (showProfileDropdown) {
      setShowProfileDropdown(false);
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
    if (showBranchDropdown) {
      setShowBranchDropdown(false);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowBranchDropdown(false);
      setShowProfileDropdown(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("loggedIn");
    Cookies.remove("type");
    Cookies.remove("salonName");
    Cookies.remove("branch_n");
    Cookies.remove("salon-name");
    navigate("/");
  };


  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);
  

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch.branch_name);

    localStorage.setItem("branch_name", branch.branch_name);
    localStorage.setItem("branch_id", branch.id);
  
    setShowBranchDropdown(false);

      window.location.reload();
  };
  
  

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav
        className={`relative z-10 h-24 bg-white shadow-md flex justify-between items-center transition-all duration-300 ${
          sidebarOpen ? "ml-[284px]" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden mx-4 p-2 block bg-white relative"
          >
            <FiMenu className="text-gray-600" style={{ fontSize: 30 }} />
          </button>
        </div>

        <div className="flex items-center gap-4 mx-4">
          <div className="relative" ref={dropdownRef}>
            <div
              className="cursor-pointer p-2 bg-gray-100 rounded-md flex items-center gap-2"
              onClick={toggleBranchDropdown}
            >
              <span>{selectedBranch || branchName}</span>
              <IoMdArrowDropdown />
            </div>
            {showBranchDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20">
                {loading ? (
                  <div className="text-gray-500 px-4 py-2">Loading...</div>
                ) : error ? (
                  <div className="text-red-500 px-4 py-2">{error}</div>
                ) : branches.length === 0 ? (
                  <div className="text-gray-500 px-4 py-2">
                    No branches available
                  </div>
                ) : (
                  branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleBranchChange(branch)}
                    >
                      {branch.branch_name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div
            className="relative cursor-pointer"
            onClick={toggleProfileDropdown}
          >
            <div className="flex flex-row items-baseline justify-center">
              {profileImage ? (
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt="Profile"
                  className="w-16 h-16 sm:w-16 sm:h-16 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-gray-500 size-14" />
              )}
              <IoMdArrowDropdown />
            </div>
            {showProfileDropdown && (
              <div
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20"
                ref={dropdownRef}
              >
                {userType === "staff" || userType === "vendor" ? (
                  <div className="text-gray-500 px-4 py-2 cursor-not-allowed opacity-50 font-semibold">
                    <span>Service</span>
                  </div>
                ) : (
                  <div className="text-gray-500 px-4 py-2 cursor-pointer hover:bg-gray-300 font-semibold">
                    <Link to={`/${sname}/${branchName}/service`}>
                      <span>Service</span>
                    </Link>
                  </div>
                )}
                <div
                  className="text-gray-500 px-4 py-2 cursor-pointer hover:bg-gray-300 font-semibold"
                  onClick={handleLogout}
                >
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {sidebarOpen && <VertNav sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
    </>
  );
}

export default Header;
