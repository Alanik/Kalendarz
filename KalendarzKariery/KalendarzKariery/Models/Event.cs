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
    
    public partial class Event
    {
        public Event()
        {
            this.Addresses = new HashSet<Address>();
            this.Users = new HashSet<User>();
        }
    
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Details { get; set; }
        public System.DateTime DateAdded { get; set; }
        public int AddedBy { get; set; }
        public System.DateTime StartDate { get; set; }
        public Nullable<int> OccupancyLimit { get; set; }
        public string WebLink { get; set; }
        public int Kind { get; set; }
        public int NumberOfPeopleAttending { get; set; }
        public int PrivacyLevel { get; set; }
        public Nullable<int> EventLengthInMinutes { get; set; }
    
        public virtual ICollection<Address> Addresses { get; set; }
        public virtual ICollection<User> Users { get; set; }
    }
}
