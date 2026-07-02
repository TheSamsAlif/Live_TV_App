import { useApp } from '../context/AppContext';
import ChannelCard from './ChannelCard';
import { useEffect, useRef } from 'react';

export default function ChannelList() {
  const { filteredChannels, currentChannel, setCurrentChannel, showFavorites, favorites } = useApp();
  const listRef = useRef(null);

  useEffect(() => {
    if (currentChannel && listRef.current) {
      const el = listRef.current.querySelector(`[data-channel-id="${currentChannel.id}"]`);
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentChannel]);

  const items = showFavorites
    ? filteredChannels.filter((ch) => favorites.includes(ch.id))
    : filteredChannels;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-dark-500 text-sm">
          {showFavorites ? 'No favorite channels yet. Click the star icon to add one.' : 'No channels found.'}
        </p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="flex flex-col gap-0.5 pb-4">
      {items.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} onSelect={setCurrentChannel} />
      ))}
    </div>
  );
}
