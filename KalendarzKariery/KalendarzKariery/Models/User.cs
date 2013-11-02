//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace KalendarzKariery.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class User
    {
        public User()
        {
            this.Addresses = new HashSet<Address>();
            this.Events = new HashSet<Event>();
            this.webpages_Roles = new HashSet<webpages_Roles>();
        }
    
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string WebSiteUrl { get; set; }
        public System.DateTime BirthDay { get; set; }
        public string Gender { get; set; }
        public string Bio { get; set; }
    
        public virtual UserInfo UserInfo { get; set; }
        public virtual ICollection<Address> Addresses { get; set; }
        public virtual ICollection<Event> Events { get; set; }
        public virtual ICollection<webpages_Roles> webpages_Roles { get; set; }
    }
}
