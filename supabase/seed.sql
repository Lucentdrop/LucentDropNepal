-- Safe editorial taxonomy only. No fake users, completed projects or documents.
insert into public.news_categories(name,slug) values ('Project Updates','project-updates'),('Technology','technology'),('Sustainability','sustainability'),('Company News','company-news') on conflict(slug) do nothing;
