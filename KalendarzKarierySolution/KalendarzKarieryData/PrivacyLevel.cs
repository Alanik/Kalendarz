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
    using System.Collections.Generic;

    public partial class PrivacyLevel
    {
        public PrivacyLevel()
        {
            this.Events = new HashSet<Event>();
            this.Notes = new HashSet<Note>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Value { get; set; }
    
        public virtual ICollection<Event> Events { get; set; }
        public virtual ICollection<Note> Notes { get; set; }
    }
}
