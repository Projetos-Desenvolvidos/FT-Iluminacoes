const steps=document.querySelectorAll('.step');
    const dots=document.querySelectorAll('.dot');

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('active');
          const dot=entry.target.querySelector('.dot');
          dot.classList.add('active');
        }
      });
    },{threshold:0.5});

    steps.forEach(step=>observer.observe(step));