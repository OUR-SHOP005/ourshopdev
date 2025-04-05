"use client";
    import { useGetServices } from "@/lib/api/services/serviceService";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ServicesPage() {
  const { data: services, isLoading: isLoadingServices } = useGetServices();


 

  if (isLoadingServices) {
    return (
      <div className='container py-12 space-y-8'>
        <div className='space-y-4 text-center'>
          <Skeleton className='h-12 w-1/3 mx-auto' />
          <Skeleton className='h-6 w-2/3 mx-auto' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='space-y-4'
            >
              <Skeleton className='h-52 w-full' />
              <Skeleton className='h-8 w-2/3' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-10 w-1/2' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='container py-12 space-y-8'>
      <div className='space-y-4 text-center'>
        <h1 className='text-4xl font-bold tracking-tight'>Our Services</h1>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          We offer a range of professional services to meet your needs. Browse
          our offerings below and get in touch to learn more.
        </p>
      </div>

      {services && services.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {services.map((service) => (
            <Card
              key={service._id}
              className='overflow-hidden flex flex-col h-full'
            >
              <div className='relative'>
                <AspectRatio ratio={16 / 9}>
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className='object-cover transition-all hover:scale-105'
                    />
                  ) : (
                    <div className='w-full h-full bg-muted flex items-center justify-center'>
                      <p className='text-muted-foreground'>
                        No image available
                      </p>
                    </div>
                  )}
                </AspectRatio>
                {service.featured && (
                  <Badge className='absolute top-2 right-2 bg-primary'>
                    Featured
                  </Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>Rs.{service.price.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent className='flex-grow'>
                <p className='line-clamp-3'>{service.description}</p>
              </CardContent>
              <CardFooter className='flex justify-between pt-2'>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline'>Learn More</Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                      <DialogTitle>{service.name}</DialogTitle>
                      <DialogDescription>
                        Rs.{service.price.toFixed(2)}
                      </DialogDescription>
                    </DialogHeader>
                    {service.image && (
                      <div className='relative w-full aspect-video overflow-hidden rounded-md'>
                        <Image
                          src={service.image}
                          alt={service.name}
                          fill
                          className='object-cover'
                        />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>
            No services available at the moment
          </p>
          <p className='mt-2'>
            Please check back later for our upcoming services
          </p>
        </div>
      )}
    </div>
  );
}
