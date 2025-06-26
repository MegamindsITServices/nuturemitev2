import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import { useAuth } from "../../context/AuthContext";

const AvatarDropdown = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const navigateTo = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" tabIndex={0}>
          <Avatar>
            <AvatarImage src="" alt="@shadcn" />
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              {auth.user.firstName
                ? auth.user.firstName.charAt(0).toUpperCase()
                : "U"}
            </div>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-4 bg-white">
        {/* <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
        <DropdownMenuSeparator /> */}

        <DropdownMenuItem
          className={"cursor-pointer"}
          onClick={() => navigateTo("/admin/profile")}
        >
          {" "}
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem className={"cursor-pointer"} onClick={handleLogout}>
          {" "}
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;
