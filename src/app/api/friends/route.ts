import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch confirmed friends
  const { data: friends, error: friendsError } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      user_id,
      friend_id,
      friend:friend_id (id, username, full_name, avatar_url),
      user:user_id (id, username, full_name, avatar_url)
    `)
    .eq('status', 'accepted')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

  if (friendsError) {
    return NextResponse.json({ error: friendsError.message }, { status: 500 });
  }

  // Fetch pending requests received
  const { data: requests, error: requestsError } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      user_id,
      friend_id,
      user:user_id (id, username, full_name, avatar_url)
    `)
    .eq('status', 'pending')
    .eq('friend_id', user.id);

  console.log('[API Debug] User ID:', user.id);
  console.log('[API Debug] Requests Query matched:', requests?.length);
  if (requestsError) console.error('[API Debug] Requests Error:', requestsError);

  if (requestsError) {
    return NextResponse.json({ error: requestsError.message }, { status: 500 });
  }

  // Fetch pending requests SENT
  const { data: sentRequests, error: sentRequestsError } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      user_id,
      friend_id,
      friend:friend_id (id, username, full_name, avatar_url)
    `)
    .eq('status', 'pending')
    .eq('user_id', user.id);

  console.log('[API Debug] Sent Requests Query matched:', sentRequests?.length);
  if (sentRequestsError) console.error('[API Debug] Sent Requests Error:', sentRequestsError);

  if (sentRequestsError) {
    return NextResponse.json({ error: sentRequestsError.message }, { status: 500 });
  }

  // Format friends list properly (normalizing user/friend fields)
  const formattedFriends = friends.map(f => {
    // If I am user_id, my friend is friend_id (the 'friend' object)
    // If I am friend_id, my friend is user_id (the 'user' object)
    const friendData = f.user_id === user.id ? f.friend : f.user;
    return {
      ...f,
      friend: friendData
    };
  });

  return NextResponse.json({ friends: formattedFriends, requests, sentRequests });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { targetEmail } = await request.json();

  // Find user by email
  const { data: targetUser, error: searchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', targetEmail)
    .single();

  if (searchError || !targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (targetUser.id === user.id) {
    return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });
  }

  // Check if friendship already exists
  const { data: existing, error: checkError } = await supabase
    .from('friendships')
    .select('status')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${targetUser.id}),and(user_id.eq.${targetUser.id},friend_id.eq.${user.id})`)
    .single();

  if (existing) {
    return NextResponse.json({ error: `Friendship status: ${existing.status}` }, { status: 409 });
  }

  // Create request
  const { error: insertError } = await supabase
    .from('friendships')
    .insert({
      user_id: user.id,
      friend_id: targetUser.id,
      status: 'pending'
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { friendshipId, status } = await request.json();

  if (!['accepted', 'blocked'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Update friendship
  const { error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)
    .eq('friend_id', user.id); // Security: Only recipient can accept

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
