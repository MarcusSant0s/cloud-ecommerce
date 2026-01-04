import Categories from '@/components/Categories';
import ProductSection from '@/components/ProductSection';
import Testimonial from '@/components/Testimonial';
import {testimonials} from '@/app/mocks'

export default function Home() {
  return (
    <div className="">
      <main className="          
      flex min-h-screen flex-col gap-y-16
       bg-gradient-to-b from-muted/50
          via-muted/25 to-background          
          ">
      

        <Categories></Categories>

         <ProductSection/>

         <Testimonial
          className="py-0"
          description="Don't just take our word for it - hear from our satisfied customers"
          testimonials={testimonials}
          title="What Our Customers Say"
         ></Testimonial>
         
      </main>
    </div>
  );
}
