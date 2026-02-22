import { Product } from '../types';

export const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Thuluth Majesty",
    category: "Classical Thuluth",
    image_url: "/products/p1/p1.png",
    images: ["/products/p1/p1.png", "/products/p1/p2.png", "/products/p1/p3.png"],
    description: "A monumental script characterized by its verticality and rhythmic flow.",
    price: 1200,
    tags: ["monumental", "classical"]
  },
  {
    id: 2,
    name: "Diwani Flow",
    category: "Ottoman Diwani",
    image_url: "/products/p2/p2.png",
    images: ["/products/p2/p2.png"],
    description: "Intricate, overlapping curves that dance across the canvas with royal elegance.",
    price: 950,
    tags: ["elegant", "royal"]
  },
  {
    id: 3,
    name: "Kufic Geometry",
    category: "Square Kufic",
    image_url: "/products/p3/p3 (1).png",
    images: ["/products/p3/p3 (1).png", "/products/p3/p3 (2).png", "/products/p3/p3 (3).png"],
    description: "Architectural precision meeting ancient angular forms.",
    price: 1500,
    tags: ["architectural", "geometric"]
  },
  {
    id: 4,
    name: "Naskh Clarity",
    category: "Classical Naskh",
    image_url: "/products/p4/p4 (1).png",
    images: ["/products/p4/p4 (1).png", "/products/p4/p4 (2).png", "/products/p4/p4 (3).png", "/products/p4/p4 (4).png"],
    description: "The script of clarity, refined for the modern digital eye.",
    price: 800,
    tags: ["refined", "digital"]
  },
  {
    id: "e1",
    name: "Echoes of a Neon Horizon",
    category: "Original Soundtrack",
    price: 450,
    image_url: "/products/p5/p5 (1).png",
    images: ["/products/p5/p5 (1).png", "/products/p5/p5 (2).png"],
    description: "Original Motion Picture Soundtrack",
    tags: ["neon", "horizon"]
  },
  {
    id: "e2",
    name: "The Gilded Crown",
    category: "Broadway Musical",
    price: 600,
    image_url: "/products/p6/p61.png",
    images: ["/products/p6/p61.png", "/products/p6/p62.png", "/products/p6/p63.png"],
    description: "Broadway Musical & Classic Animation",
    tags: ["gilded", "crown"]
  },
];
