const products = [ 
  {
    "title": "How to Stop Time",
    "author": "Matt Haig",
    "price": 499,
    "description": "A fascinating novel about a man who ages extremely slowly and has lived for centuries.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685993/1_pgctz8.jpg",
    "genres": ["Fantasy", "Science Fiction", "Romance"]
  },
  {
    "title": "Cogheart",
    "author": "Peter Bunzl",
    "price": 399,
    "description": "An adventure story set in a steampunk world filled with mechanical wonders.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685994/2_defk9n.jpg",
    "genres": ["Young Adult", "Steampunk", "Adventure"]
  },
  {
    "title": "Looking for Alaska",
    "author": "John Green",
    "price": 450,
    "description": "A coming-of-age novel that explores love, friendship, and the search for meaning.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685992/3_iyzvdy.jpg",
    "genres": ["Young Adult", "Contemporary", "Romance"]
  },
  {
    "title": "Charles Dickens: Four Great Novels",
    "author": "Charles Dickens",
    "price": 999,
    "description": "A collection of four timeless novels from the legendary author Charles Dickens.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685992/4_xkvoy8.jpg",
    "genres": ["Classics", "Historical Fiction", "Literary Fiction"]
  },
  {
    "title": "Gulliver’s Travels",
    "author": "Jonathan Swift",
    "price": 349,
    "description": "A satirical travelogue that critiques society through the adventures of Lemuel Gulliver.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685991/5_kigrsx.jpg",
    "genres": ["Classics", "Satire", "Adventure"]
  },
  {
    "title": "Matilda",
    "author": "Roald Dahl",
    "price": 399,
    "description": "A beloved children’s book about a genius girl with extraordinary powers.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685992/6_ruuo8c.jpg",
    "genres": ["Children's", "Fantasy", "Humor"]
  },
  {
    "title": "The Story of My Life",
    "author": "Helen Keller",
    "price": 299,
    "description": "An inspiring autobiography of Helen Keller and her journey of overcoming challenges.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685995/7_d1xqpw.jpg",
    "genres": ["Autobiography", "Memoir", "Non-fiction"]
  },
  {
    "title": "The Journey of Rock: Four Days One Dream One Stage",
    "author": "Unknown",
    "price": 599,
    "description": "A music-related book capturing the essence of rock concerts and the journey of musicians.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685995/8_sezusm.jpg",
    "genres": ["Music", "Non-fiction", "Entertainment"]
  },
  {
    "title": "The Echo Man",
    "author": "Richard Montanari",
    "price": 499,
    "description": "A gripping thriller featuring a detective chasing a ruthless serial killer.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685995/9_bd9qrv.jpg",
    "genres": ["Thriller", "Mystery", "Crime"]
  },
  {
    "title": "The Untouchable",
    "author": "Gerald Seymour",
    "price": 550,
    "description": "An intense thriller exploring crime, justice, and the cost of doing the right thing.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685995/10_juutpd.jpg",
    "genres": ["Thriller", "Crime", "Suspense"]
  },
  {
    "title": "Eclipse",
    "author": "Stephenie Meyer",
    "price": 450,
    "description": "The third book in the Twilight Saga, filled with romance, danger, and supernatural elements.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685996/11_qq0bps.jpg",
    "genres": ["Young Adult", "Fantasy", "Romance", "Paranormal"]
  },
  {
    "title": "Harry Potter and the Half-Blood Prince",
    "author": "J.K. Rowling",
    "price": 699,
    "description": "The sixth book in the Harry Potter series, uncovering secrets of Voldemort's past.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685996/12_b80uqr.jpg",
    "genres": ["Fantasy", "Young Adult", "Magic"]
  },
  {
    "title": "Tess of the D’Urbervilles",
    "author": "Thomas Hardy",
    "price": 350,
    "description": "A tragic novel exploring themes of fate, social class, and morality.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685991/13_swbmzp.jpg",
    "genres": ["Classics", "Literary Fiction", "Romance", "Tragedy"]
  },
  {
    "title": "A Tale of Two Cities",
    "author": "Charles Dickens",
    "price": 399,
    "description": "A historical novel set during the French Revolution, exploring themes of sacrifice and justice.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685992/14_mggi6r.jpg",
    "genres": ["Classics", "Historical Fiction", "Literary Fiction"]
  },
  {
    "title": "King Lear",
    "author": "William Shakespeare",
    "price": 299,
    "description": "A Shakespearean tragedy about betrayal, madness, and the downfall of a king.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685992/15_hjbbgv.jpg",
    "genres": ["Classics", "Drama", "Tragedy"]
  },
  {
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "price": 499,
    "description": "A philosophical novel about self-discovery and following one’s dreams.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685997/16_mszwli.jpg",
    "genres": ["Literary Fiction", "Philosophy", "Spirituality"]
  },
  {
    "title": "Kafka on the Shore",
    "author": "Haruki Murakami",
    "price": 550,
    "description": "A metaphysical novel intertwining the stories of a teenage boy and an elderly man on parallel journeys.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685992/17_xs9dge.jpg",
    "genres": ["Magical Realism", "Fantasy", "Literary Fiction"]
  },
  {
    "title": "Mandarin Gate",
    "author": "Eliot Pattison",
    "price": 600,
    "description": "Inspector Shan navigates the political and religious landscape of Tibet while investigating a complex crime scene.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685993/18_wtv5vp.jpg",
    "genres": ["Mystery", "Thriller", "Historical Fiction"]
  },
  {
    "title": "Knightley and Son",
    "author": "Rohan Gavin",
    "price": 400,
    "description": "A father-son detective duo uncovers secrets and solves mysteries in this thrilling adventure.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685992/19_hljmn4.jpg",
    "genres": ["Young Adult", "Mystery", "Adventure"]
  },
  {
    "title": "Set in Darkness",
    "author": "Ian Rankin",
    "price": 500,
    "description": "Detective Inspector Rebus investigates a series of crimes set against the backdrop of political change in Scotland.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685993/20_sqltvr.jpg",
    "genres": ["Crime", "Mystery", "Thriller"]
  },
  {
    "title": "Let It Snow",
    "author": "John Green, Maureen Johnson, Lauren Myracle",
    "price": 450,
    "description": "A collection of three interconnected holiday romances set during a Christmas Eve snowstorm.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685993/21_q2obks.jpg",
    "genres": ["Young Adult", "Romance", "Holiday"]
  },
  {
    "title": "Love Like Blood",
    "author": "Mark Billingham",
    "price": 550,
    "description": "Detectives Tom Thorne and Nicola Tanner delve into the dark world of honor killings in this gripping thriller.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685993/22_io7lp8.jpg",
    "genres": ["Crime", "Thriller", "Mystery"]
  },
  {
    "title": "A Secret Kept",
    "author": "Tatiana de Rosnay",
    "price": 480,
    "description": "A family drama unfolds as buried secrets come to light during a trip to the French coast.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685994/23_zndb9w.jpg",
    "genres": ["Literary Fiction", "Mystery", "Family"]
  },
  {
    "title": "Men Without Women",
    "author": "Haruki Murakami",
    "price": 520,
    "description": "A collection of short stories exploring themes of isolation and loss among men without women.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685994/24_npuomi.jpg",
    "genres": ["Short Stories", "Literary Fiction", "Contemporary"]
  },
  {
    "title": "The Kite Runner",
    "author": "Khaled Hosseini",
    "price": 600,
    "description": "A poignant tale of friendship and redemption set against the backdrop of a changing Afghanistan.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685994/25_vlawcx.jpg",
    "genres": ["Historical Fiction", "Drama", "Literary Fiction"]
  },
  {
    "title": "A Thousand Splendid Suns",
    "author": "Khaled Hosseini",
    "price": 650,
    "description": "An emotional story of two women's intertwined lives amidst the turmoil of Afghanistan's history.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685994/26_s3oqmw.jpg",
    "genres": ["Historical Fiction", "Drama", "Literary Fiction"]
  },
  {
    "title": "Omniscient Reader's Viewpoint",
    "author": "Sing-Shong",
    "price": 700,
    "description": "A reader finds himself trapped in his favorite web novel, navigating a world he thought was fictional.",
    "coverImage": "https://res.cloudinary.com/djlsg1msm/image/upload/v1742685996/27_ylpvdz.png",
    "genres": ["Fantasy", "Adventure", "Isekai"]
  }

];

export default products;
