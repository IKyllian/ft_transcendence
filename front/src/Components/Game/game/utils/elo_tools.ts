export function elo_to_rank_as_string (elo: number) :string  
{
	if (elo >= 1500)
		return 'Legend'
	else if (elo >= 1375)
		return 'Champion'
	else if (elo >= 1250)
		return 'Diamond'
	else if (elo >= 1125)
		return 'Platine'
	else if (elo >= 1000)
		return 'Gold'
	else
		return 'Silver'
}

export function check_rank_change (oldElo: number, newElo: number): boolean
{
	if (elo_to_rank_as_string(oldElo) === elo_to_rank_as_string(newElo))
		return false;
	return true;
}