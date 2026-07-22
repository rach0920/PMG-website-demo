alter table public.team_members
add column if not exists bio text;

update public.team_members
set title = 'Senior Property Manager',
    bio = 'For more than 12 years, Rachel Han has worked with property owners across Sydney, helping them manage and maintain investment properties with confidence.

Throughout her career, Rachel has managed various sizes of property portfolios across Sydney, working with a wide range of investors both residential and commercial properties. Her experience has given her a strong understanding of the day-to-day responsibilities of property management, as well as the importance of communication, organisation and consistency in achieving long-term results.

Rachel is known for her approachable nature, attention to detail and practical approach to problem solving. She believes that successful property management comes from understanding each client''s expectations, responding promptly and maintaining strong relationships with both landlords and tenants.

As Senior Property Manager at Premium Management Group, Rachel works closely with every client to ensure their property is managed with professionalism, care and attention to detail, giving owners confidence that their investment is in experienced hands.'
where lower(name) = 'rachel han';

update public.team_members
set title = 'Principal',
    bio = 'With over 30 years of experience in the real estate industry, Edwin Lee has built a career spanning residential property sales, commercial property management, and investment property advice.

Edwin''s introduction to real estate came through the family business, where he worked alongside his father and developed a practical understanding of the industry early in his career. Over the years, he has worked with homeowners, investors and commercial property owners across a wide range of transactions, earning a reputation for honest advice and long term relationships.

Today, Edwin is the Founder and Managing Director of Premium Management Group, specialising in Property Sales, Residential and Commercial Property Management. His broad industry experience allows him to understand not only the transaction itself, but also the long-term goals behind every property decision.

Clients value Edwin for his straightforward approach, clear communication and ability to navigate both straightforward and complex property matters with confidence. Whether representing a property sale or overseeing a commercial asset, his focus remains the same to provide reliable advice, strong representation, and a level of service clients can rely on.'
where lower(name) = 'edwin lee';
