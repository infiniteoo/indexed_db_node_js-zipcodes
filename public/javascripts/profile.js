const template = `
<h2>${profile.name}</h2>
<div class='row'>
      <div class='col-md-4'>
         <img height='250' width='250'/>
      </div>
      <div class='col-md-4'>
         <h3>Age: ${profile.age}</h3>
         <h3>City: ${profile.city}</h3>
         <h3>State: ${profile.state}</h3>
         <h3>Company: ${profile.company}</h3>
         <h3>Email: ${profile.email}</h3>
      </div>
      <div class='col-md-4'>
         <h3>Gender: ${profile.gender}</h3>
         <h3>Phone: ${profile.phone}</h3>
         <h3>Zipcode: ${profile.zipcode}</h3>
         <h3>Latitude: ${profile.latitude}</h3>
         <h3>Longitude: ${profile.longitude}</h3>
      </div>
   </div>
`
