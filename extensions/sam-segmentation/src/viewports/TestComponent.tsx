import React from 'react'

const capture_image = () => {
  const canvas = document.getElementsByClassName('cornerstone-canvas')[1] as HTMLCanvasElement;
  const imageDataUrl = canvas.toDataURL('image/png');

  // Open the image in a new browser tab
  window.open(imageDataUrl, '_blank');

}

function TestComponent({props}) {
  return (
    <div>
      <button onClick={capture_image}
      style={
        {
          width: '100px',
          height: '100px',
          zIndex: '9999',
          backgroundColor: 'red',
          color: 'white',
          padding: '10px',
          border: 'none',
          borderRadius: '5px'
        }

      }> Hola pulsame</button>
      <h1 >Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet ullam enim maxime saepe ipsum fuga, ratione fugit accusamus nobis aut. Quia officia et porro autem quas perferendis corporis tempore facilis delectus a, voluptas provident. Ratione enim iure quibusdam earum labore, necessitatibus explicabo, error eligendi consequuntur temporibus ullam quae qui perferendis minima, cumque fuga possimus rem repellendus maxime maiores! Officia aperiam sequi fuga autem soluta perferendis iure, officiis ea temporibus odit, eligendi iusto quae libero ratione doloribus fugiat! Voluptatibus impedit ea repellat dolorem aspernatur eum itaque, enim eius esse accusantium, nesciunt debitis deserunt iure quaerat unde quis tempora similique perferendis numquam alias atque cumque, vero sunt delectus? Minima cum repudiandae, illum dignissimos consequatur similique repellendus. Ipsum sit doloribus voluptatum recusandae magnam debitis sed officiis eos veniam similique, excepturi dolores facilis doloremque, voluptas at! Dolorem dicta quos laudantium culpa, accusantium deleniti aliquid eius natus. Sit provident corporis hic optio commodi cumque, non tempore incidunt magni dolorum fugit perspiciatis deserunt facere modi. Placeat impedit velit eius suscipit hic facilis assumenda possimus earum dignissimos aspernatur! Minima deserunt consequuntur quibusdam nam temporibus possimus, voluptatum qui non labore veritatis dolor molestias accusantium unde iure molestiae, officia modi accusamus magni. Dignissimos, dolorum ipsam. Quas eum provident facere ratione perferendis aut sunt consequuntur quibusdam recusandae nisi corporis ea dignissimos unde cupiditate repellendus, placeat nesciunt. Ipsum officiis excepturi quos. Delectus ipsam, quod praesentium earum sunt accusantium iste error dolore ullam illum ea culpa eaque voluptatibus perferendis tenetur voluptate assumenda nisi inventore. Veritatis molestias minima, quaerat officiis omnis, inventore iste rem consectetur deserunt qui tempore recusandae voluptas quibusdam debitis nobis! Pariatur iure quam perferendis error! Ducimus corporis tempora, nesciunt beatae repudiandae temporibus nulla omnis molestias sunt reiciendis soluta. Commodi nostrum provident assumenda dignissimos doloribus? Libero voluptas consectetur earum dolor maxime maiores blanditiis corrupti enim error, harum accusantium veniam illum sunt impedit aspernatur nobis dolorem eum minus dicta. Ratione deleniti esse voluptatem alias ab, consectetur in vero eum, sit dolores molestias saepe, commodi velit incidunt quibusdam explicabo quod obcaecati. Quae nemo error sapiente necessitatibus, eius in doloremque magni assumenda aperiam vero officiis architecto dolore laborum exercitationem unde sed adipisci quod non officia reprehenderit libero placeat. Expedita, quam. Culpa corporis doloribus ipsum perferendis quaerat, dignissimos vel quisquam libero cum sed soluta voluptas. Sapiente cum fuga totam iure maiores modi eligendi? Architecto quaerat sequi repellat dignissimos libero, ipsa corrupti inventore, repudiandae, vero recusandae iste dolorum dolores corporis nihil aspernatur ut. Esse id quas perspiciatis consectetur? Nobis architecto ea ipsam exercitationem iste fugiat doloremque dolore velit? Dolor ducimus eum in dolorum. Blanditiis nostrum non provident numquam labore voluptatem, expedita nemo, quam quaerat modi in fugiat at, vitae dignissimos. Voluptate aspernatur sunt obcaecati nam beatae quis quia expedita quam adipisci corrupti nihil eligendi perspiciatis, ipsum molestiae vitae quod eius unde magni saepe nesciunt veniam ad quidem quisquam. Dolorum nobis maxime velit quis! Eos, vero ipsam tenetur fuga expedita illo adipisci soluta nesciunt, rem labore modi facilis accusamus quia? Nemo fuga iste, reiciendis aut nulla praesentium vel, nihil dolor facere amet quo quia id beatae hic!
      </h1>
    </div>
  )
}

export default TestComponent
