//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace KalendarzKarieryData
{
    using System;
    using System.Collections.Generic;
    
    public partial class UserAccountInfo
    {
        public UserAccountInfo()
        {
            this.Users = new HashSet<User>();
        }
    
        public int Id { get; set; }
        public Nullable<System.DateTime> LastLogin { get; set; }
        public Nullable<System.DateTime> LastLogout { get; set; }
        public int NumOfLogins { get; set; }
        public Nullable<long> TotalLoginTime { get; set; }
        public Nullable<long> AverageLoginTime { get; set; }
        public System.DateTime CreateDate { get; set; }
        public Nullable<System.DateTime> EditDate { get; set; }
    
        public virtual ICollection<User> Users { get; set; }
    }
}
